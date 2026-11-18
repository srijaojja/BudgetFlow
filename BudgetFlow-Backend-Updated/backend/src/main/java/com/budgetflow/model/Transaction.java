
package com.budgetflow.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bf_transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public Long userId;

    public String title;
    public BigDecimal amount;
    public String type;
    public Long categoryId;
    public LocalDate transactionDate;
}
