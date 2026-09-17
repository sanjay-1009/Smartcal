package com.smartcalendar.security;

import com.smartcalendar.entity.User;
import com.smartcalendar.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String usernameOrPhone) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrMobileNumber(usernameOrPhone, usernameOrPhone)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username or mobile: " + usernameOrPhone));

        return UserDetailsImpl.build(user);
    }
}
