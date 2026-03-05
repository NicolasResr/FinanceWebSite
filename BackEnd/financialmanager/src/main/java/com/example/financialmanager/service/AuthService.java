package com.example.financialmanager.service;

import com.example.financialmanager.dto.request.LoginRequest;
import com.example.financialmanager.dto.request.RegisterRequest;
import com.example.financialmanager.dto.response.AuthResponse;
import com.example.financialmanager.dto.response.UserResponse;
import com.example.financialmanager.entity.User;
import com.example.financialmanager.exception.BusinessException;
import com.example.financialmanager.repository.UserRepository;
import com.example.financialmanager.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));

        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .user(userResponse)
                .build();
    }
}
