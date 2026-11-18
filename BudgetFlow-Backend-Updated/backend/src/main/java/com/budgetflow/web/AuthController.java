
package com.budgetflow.web;

import com.budgetflow.model.User;
import com.budgetflow.model.PasswordResetCode;
import com.budgetflow.repo.UserRepository;
import com.budgetflow.repo.PasswordResetCodeRepository;
import com.budgetflow.config.JwtService;
import com.budgetflow.config.PasswordResetEmailService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtService jwt;
    private final PasswordResetCodeRepository resetCodes;
    private final PasswordResetEmailService resetEmail;

    private final SecureRandom random = new SecureRandom();

    public AuthController(
            UserRepository users,
            PasswordEncoder passwords,
            JwtService jwt,
            PasswordResetCodeRepository resetCodes,
            PasswordResetEmailService resetEmail
    ) {
        this.users = users;
        this.passwords = passwords;
        this.jwt = jwt;
        this.resetCodes = resetCodes;
        this.resetEmail = resetEmail;
    }

    public record Credentials(
            String name,
            String email,
            String password
    ) {}

    public record ForgotPasswordRequest(String email) {}

    public record ResetPasswordRequest(
            String email,
            String code,
            String newPassword
    ) {}

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody Credentials c
    ) {
        if (c == null ||
                c.email() == null ||
                c.email().isBlank() ||
                c.password() == null ||
                c.password().length() < 8 ||
                c.name() == null ||
                c.name().isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Name, email and password (8+ characters) are required"
                    )
            );
        }

        String email = c.email().trim().toLowerCase(Locale.ROOT);

        if (users.findByEmail(email).isPresent()) {
            return ResponseEntity.status(409).body(
                    Map.of("message", "Email already registered")
            );
        }

        User u = new User();
        u.name = c.name().trim();
        u.email = email;
        u.password = passwords.encode(c.password());

        users.save(u);

        return ResponseEntity.ok(
                Map.of("token", jwt.issue(email))
        );
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Credentials c
    ) {
        if (c == null ||
                c.email() == null ||
                c.password() == null) {

            return ResponseEntity.status(401).body(
                    Map.of("message", "Invalid credentials")
            );
        }

        String email = c.email().trim().toLowerCase(Locale.ROOT);

        var user = users.findByEmail(email);

        if (user.isEmpty() ||
                !passwords.matches(
                        c.password(),
                        user.get().password
                )) {

            return ResponseEntity.status(401).body(
                    Map.of("message", "Invalid credentials")
            );
        }

        return ResponseEntity.ok(
                Map.of("token", jwt.issue(user.get().email))
        );
    }

    // SEND PASSWORD RESET OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {
        if (request == null ||
                request.email() == null ||
                request.email().isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email is required")
            );
        }

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        String reply =
                "If this email is registered, a reset code has been sent.";

        if (users.findByEmail(email).isEmpty()) {
            return ResponseEntity.ok(
                    Map.of("message", reply)
            );
        }

        Instant now = Instant.now();

        var previous = resetCodes.findById(email);

        if (previous.isPresent() &&
                previous.get().createdAt.isAfter(
                        now.minus(60, ChronoUnit.SECONDS)
                )) {

            return ResponseEntity.ok(
                    Map.of("message", reply)
            );
        }

        String code = String.format(
                "%06d",
                random.nextInt(1_000_000)
        );

        PasswordResetCode record = previous.orElseGet(
                PasswordResetCode::new
        );

        record.email = email;
        record.codeHash = passwords.encode(code);
        record.createdAt = now;
        record.expiresAt = now.plus(
                10,
                ChronoUnit.MINUTES
        );
        record.attempts = 0;

        resetCodes.save(record);

        resetEmail.sendResetCode(email, code);

        return ResponseEntity.ok(
                Map.of("message", reply)
        );
    }

    // VERIFY OTP AND RESET PASSWORD
    @Transactional
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) {
        if (request == null ||
                request.email() == null ||
                request.email().isBlank() ||
                request.code() == null ||
                !request.code().matches("[0-9]{6}") ||
                request.newPassword() == null ||
                request.newPassword().length() < 8) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Valid email, 6-digit code and new password (8+ characters) are required"
                    )
            );
        }

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        var found = resetCodes.findForUpdate(email);

        if (found.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid or expired reset code")
            );
        }

        PasswordResetCode record = found.get();

        if (!record.expiresAt.isAfter(Instant.now()) ||
                record.attempts >= 5) {

            resetCodes.delete(record);

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid or expired reset code")
            );
        }

        if (!passwords.matches(
                request.code(),
                record.codeHash
        )) {
            record.attempts++;
            resetCodes.save(record);

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid or expired reset code")
            );
        }

        var user = users.findByEmail(email);

        if (user.isEmpty()) {
            resetCodes.delete(record);

            return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid or expired reset code")
            );
        }

        user.get().password = passwords.encode(
                request.newPassword()
        );

        users.save(user.get());
        resetCodes.delete(record);

        return ResponseEntity.ok(
                Map.of("message", "Password reset successful")
        );
    }

    // LOGGED-IN USER PROFILE
    @GetMapping("/me")
    public ResponseEntity<?> me(
            Authentication authentication
    ) {
        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity.status(401).body(
                    Map.of("message", "Not authenticated")
            );
        }

        String email = authentication.getName();

        var user = users.findByEmail(email);

        if (user.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of("message", "User not found")
            );
        }

        User u = user.get();

        return ResponseEntity.ok(
                Map.of(
                        "name", u.name,
                        "email", u.email
                )
        );
    }
}
