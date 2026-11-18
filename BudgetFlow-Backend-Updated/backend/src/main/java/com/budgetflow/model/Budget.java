
package com.budgetflow.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bf_budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public Long userId;

    public String name;
    public Long categoryId;
    public BigDecimal amount;
    public Integer month;
    public Integer year;
    public LocalDate startDate;
    public LocalDate endDate;
}
