package vttp.batch5.groupb.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.micrometer.core.instrument.Counter;
import jakarta.validation.Valid;
import vttp.batch5.groupb.project.dto.JwtResponse;
import vttp.batch5.groupb.project.dto.LoginRequest;
import vttp.batch5.groupb.project.dto.UserDto;
import vttp.batch5.groupb.project.model.User;
import vttp.batch5.groupb.project.security.JwtUtils;
import vttp.batch5.groupb.project.service.EmailService;
import vttp.batch5.groupb.project.service.UserDetailsImpl;
import vttp.batch5.groupb.project.service.UserService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UserService userService;
    
    @Autowired
    JwtUtils jwtUtils;
    
    @Autowired
    private Counter userLoginCounter;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        userLoginCounter.increment();
        
        return ResponseEntity.ok(new JwtResponse(jwt,
                                                userDetails.getId(),
                                                userDetails.getUsername(),
                                                userDetails.getEmail()));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDto userDto) {
        if (userService.existsByUsername(userDto.getUsername())) {
            return ResponseEntity.badRequest().body("Username is already taken!");
        }
        
        if (userService.existsByEmail(userDto.getEmail())) {
            return ResponseEntity.badRequest().body("Email is already in use!");
        }
        
        User user = userService.registerUser(userDto);
        
        try {
            emailService.sendWelcomeEmail(user);
        } catch (Exception e) {
        }
        
        return ResponseEntity.ok("User registered successfully!");
    }
} 