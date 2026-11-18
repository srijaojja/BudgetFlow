
package com.budgetflow.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "bf_password_reset_codes")
public class PasswordResetCode {

    @Id
    @Column(nullable = false, length = 320)
    public String email;

    @Column(nullable = false, length = 100)
    public String codeHash;

    @Column(nullable = false)
    public Instant createdAt;

    @Column(nullable = false)
    public Instant expiresAt;

    @Column(nullable = false)
    public int attempts;
}
