package com.smartcalendar.repository;

import com.smartcalendar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByMobileNumber(String mobileNumber);
    
    @Query("SELECT u FROM User u WHERE LOWER(TRIM(u.username)) = LOWER(TRIM(:username)) OR LOWER(TRIM(u.mobileNumber)) = LOWER(TRIM(:mobileNumber))")
    Optional<User> findByUsernameOrMobileNumber(@Param("username") String username, @Param("mobileNumber") String mobileNumber);

    Boolean existsByUsernameIgnoreCase(String username);
    Boolean existsByMobileNumberIgnoreCase(String mobileNumber);
}
