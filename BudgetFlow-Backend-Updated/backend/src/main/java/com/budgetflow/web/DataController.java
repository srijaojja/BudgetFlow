
package com.budgetflow.web;

import com.budgetflow.model.*;
import com.budgetflow.repo.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class DataController {

 private final UserRepository users;
 private final CategoryRepository categories;
 private final TransactionRepository transactions;
 private final BudgetRepository budgets;

 public DataController(
         UserRepository users,
         CategoryRepository categories,
         TransactionRepository transactions,
         BudgetRepository budgets
 ) {
  this.users = users;
  this.categories = categories;
  this.transactions = transactions;
  this.budgets = budgets;
 }

 private Long uid(Authentication auth) {
  return users.findByEmail(auth.getName())
          .orElseThrow(() ->
                  new ResponseStatusException(
                          HttpStatus.UNAUTHORIZED
                  )
          ).id;
 }

 // CATEGORIES

 @GetMapping("/categories")
 public List<Category> categories(Authentication a) {
  return categories.findByUserId(uid(a));
 }

 @PostMapping("/categories")
 public Category category(
         @RequestBody Category c,
         Authentication a
 ) {
  c.id = null;
  c.userId = uid(a);

  if (c.name == null || c.name.isBlank()) {
   throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Category name required"
   );
  }

  return categories.save(c);
 }

 @DeleteMapping("/categories/{id}")
 public void deleteCategory(
         @PathVariable Long id,
         Authentication a
 ) {
  categories.delete(
          categories.findByIdAndUserId(id, uid(a))
                  .orElseThrow(() ->
                          new ResponseStatusException(
                                  HttpStatus.NOT_FOUND
                          )
                  )
  );
 }

 // TRANSACTIONS

 @GetMapping("/transactions")
 public List<Transaction> transactions(Authentication a) {
  return transactions.findByUserId(uid(a));
 }

 @PostMapping("/transactions")
 public Transaction transaction(
         @RequestBody Map<String, Object> payload,
         Authentication a
 ) {
  Transaction t = new Transaction();

  t.userId = uid(a);

  t.title = Objects.toString(
          payload.getOrDefault("title", "")
  );

  t.type = Objects.toString(
          payload.getOrDefault("type", "EXPENSE")
  );

  t.amount = new java.math.BigDecimal(
          Objects.toString(
                  payload.getOrDefault("amount", "0")
          )
  );

  t.categoryId = Long.valueOf(
          Objects.toString(payload.get("categoryId"))
  );

  if (categories.findByIdAndUserId(
          t.categoryId,
          t.userId
  ).isEmpty()) {

   throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Unknown category"
   );
  }

  Object d = payload.getOrDefault(
          "transactionDate",
          payload.get("date")
  );

  t.transactionDate = d == null
          ? LocalDate.now()
          : LocalDate.parse(d.toString());

  return transactions.save(t);
 }

 @DeleteMapping("/transactions/{id}")
 public void deleteTransaction(
         @PathVariable Long id,
         Authentication a
 ) {
  transactions.delete(
          transactions.findByIdAndUserId(id, uid(a))
                  .orElseThrow(() ->
                          new ResponseStatusException(
                                  HttpStatus.NOT_FOUND
                          )
                  )
  );
 }

 // BUDGETS

 @GetMapping("/budgets")
 public List<Budget> budgets(Authentication a) {
  return budgets.findByUserId(uid(a));
 }

 @PostMapping("/budgets")
 public Budget budget(
         @RequestBody Budget b,
         Authentication a
 ) {
  b.id = null;
  b.userId = uid(a);

  if (b.categoryId == null
          || categories.findByIdAndUserId(
          b.categoryId,
          b.userId
  ).isEmpty()) {

   throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Unknown category"
   );
  }

  if (b.month == null
          || b.year == null
          || b.month < 1
          || b.month > 12
          || b.amount == null) {

   throw new ResponseStatusException(
           HttpStatus.BAD_REQUEST,
           "Month, year and amount required"
   );
  }

  if (b.name == null || b.name.isBlank()) {
   b.name = "Monthly Budget";
  }

  if (b.startDate == null) {
   b.startDate = LocalDate.of(
           b.year,
           b.month,
           1
   );
  }

  if (b.endDate == null) {
   b.endDate = b.startDate
           .plusMonths(1)
           .minusDays(1);
  }

  return budgets.save(b);
 }

 @DeleteMapping("/budgets/{id}")
 public void deleteBudget(
         @PathVariable Long id,
         Authentication a
 ) {
  budgets.delete(
          budgets.findByIdAndUserId(id, uid(a))
                  .orElseThrow(() ->
                          new ResponseStatusException(
                                  HttpStatus.NOT_FOUND
                          )
                  )
  );
 }
}
