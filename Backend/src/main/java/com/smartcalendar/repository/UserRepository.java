package com.smartcalendar.repository;

import com.smartcalendar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByMobileNumber(String mobileNumber);
    Optional<User> findByUsernameOrMobileNumber(String username, String mobileNumber);
    Boolean existsByUsername(String username);
    Boolean existsByMobileNumber(String mobileNumber);
}
