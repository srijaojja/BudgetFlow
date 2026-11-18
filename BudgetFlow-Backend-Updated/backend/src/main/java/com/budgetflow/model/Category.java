
package com.budgetflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bf_categorys")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public Long userId;

    public String name;
    public String type;
}
