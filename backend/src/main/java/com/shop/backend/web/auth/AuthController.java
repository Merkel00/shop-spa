package com.shop.backend.web.auth;

import com.shop.backend.domain.profile.ProfileEntity;
import com.shop.backend.domain.profile.ProfileRepository;
import com.shop.backend.domain.user.UserEntity;
import com.shop.backend.domain.user.UserRepository;
import com.shop.backend.security.JwtService;
import com.shop.backend.web.auth.AuthDtos.AuthResponse;
import com.shop.backend.web.auth.AuthDtos.LoginRequest;
import com.shop.backend.web.auth.AuthDtos.RegisterRequest;
import com.shop.backend.web.auth.AuthDtos.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final UserRepository users;
  private final ProfileRepository profiles;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthController(
      UserRepository users,
      ProfileRepository profiles,
      PasswordEncoder encoder,
      JwtService jwt
  ) {
    this.users = users;
    this.profiles = profiles;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
    String email = req.email().trim().toLowerCase();
    String password = req.password();
    String name = req.name().trim();

    if (users.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already taken");
    }

    var u = new UserEntity();
    u.setEmail(email);
    u.setPasswordHash(encoder.encode(password));
    u.setRole("USER");
    u = users.save(u);

    var profile = new ProfileEntity();
    profile.setUserId(u.getId());
    profile.setEmail(email);
    profile.setName(name);
    profile.setPhone("");
    profile.setAddress("");
    profile.setPreferences("{}");
    profiles.save(profile);

    String token = jwt.generate(u.getId(), u.getEmail(), u.getRole());
    return new AuthResponse(token, new UserDto(u.getId(), u.getEmail(), u.getRole()));
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest req) {
    String email = req.email().trim().toLowerCase();
    String password = req.password();

    var u = users.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!encoder.matches(password, u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    String token = jwt.generate(u.getId(), u.getEmail(), u.getRole());
    return new AuthResponse(token, new UserDto(u.getId(), u.getEmail(), u.getRole()));
  }
}