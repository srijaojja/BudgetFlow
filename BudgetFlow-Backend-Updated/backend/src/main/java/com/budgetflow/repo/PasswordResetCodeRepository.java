
package com.budgetflow.repo;

import com.budgetflow.model.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface PasswordResetCodeRepository
        extends JpaRepository<PasswordResetCode, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from PasswordResetCode r where r.email = :email")
    Optional<PasswordResetCode> findForUpdate(
            @Param("email") String email
    );
}
