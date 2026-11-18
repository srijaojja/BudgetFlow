
package com.budgetflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetEmailService {

    private final JavaMailSender mailSender;
    private final String from;

    public PasswordResetEmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String from
    ) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(from);
        message.setTo(to);
        message.setSubject("BudgetFlow password reset code");
        message.setText(
                "Your BudgetFlow password reset code is: " + code +
                        "\n\nThis code expires in 10 minutes." +
                        "\nIf you did not request this, ignore this email."
        );

        mailSender.send(message);
    }
}
