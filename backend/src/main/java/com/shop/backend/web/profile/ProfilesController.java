package com.shop.backend.web.profile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.backend.domain.profile.ProfileEntity;
import com.shop.backend.domain.profile.ProfileRepository;
import com.shop.backend.domain.user.UserRepository;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/profiles")
public class ProfilesController {

  private final ProfileRepository repo;
  private final ObjectMapper mapper;
  private final UserRepository users;

public ProfilesController(ProfileRepository repo, ObjectMapper mapper, UserRepository users) {
  this.repo = repo;
  this.mapper = mapper;
  this.users = users;
}
  

@GetMapping("/{userId}")
public ProfileDto get(@PathVariable Long userId, Authentication auth) {
  requireSelf(userId, auth);

  var u = users.findById(userId)
      .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

  return repo.findById(userId)
      .map(this::toDto)
      .orElseGet(() -> new ProfileDto(
          String.valueOf(userId),
          u.getEmail(),                   
          u.getEmail().split("@")[0],           
          "",
          "",
          new ProfileDto.Preferences("light", false, "")
      ));
}

@PutMapping("/{userId}")
public ProfileDto upsert(@PathVariable Long userId, @Valid @RequestBody ProfileDto dto, Authentication auth) {
  requireSelf(userId, auth);

  var u = users.findById(userId)
      .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

  var p = repo.findById(userId).orElseGet(ProfileEntity::new);
  p.setUserId(userId);
  p.setEmail(u.getEmail());                   
  p.setName(dto.name());
  p.setPhone(dto.phone() == null ? "" : dto.phone());
  p.setAddress(dto.address() == null ? "" : dto.address());
  p.setUpdatedAt(Instant.now());

  try {
    p.setPreferences(mapper.writeValueAsString(dto.preferences()));
  } catch (Exception e) {
    throw new ResponseStatusException(BAD_REQUEST, "Invalid preferences");
  }

  return toDto(repo.save(p));
}

  @PostMapping
  public ProfileDto create(@Valid @RequestBody ProfileDto dto, Authentication auth) {
    Long userId = parseUserId(dto.id());
    return upsert(userId, dto, auth);
  }

  private ProfileDto toDto(ProfileEntity p) {
    ProfileDto.Preferences prefs;
    try {
      prefs = mapper.readValue(p.getPreferences(), ProfileDto.Preferences.class);
    } catch (Exception e) {
      prefs = new ProfileDto.Preferences("light", false, "");
    }

    return new ProfileDto(
        String.valueOf(p.getUserId()),
        p.getEmail(),
        p.getName(),
        p.getPhone(),
        p.getAddress(),
        prefs
    );
  }

  private void requireSelf(Long userId, Authentication auth) {
    if (auth == null || auth.getName() == null) {
      throw new ResponseStatusException(UNAUTHORIZED, "Unauthenticated");
    }
    Long tokenUserId = Long.parseLong(auth.getName());
    if (!tokenUserId.equals(userId)) {
      throw new ResponseStatusException(FORBIDDEN, "Forbidden");
    }
  }

  private Long parseUserId(String raw) {
    try {
      return Long.parseLong(raw);
    } catch (Exception e) {
      throw new ResponseStatusException(BAD_REQUEST, "Invalid profile id");
    }
  }
}