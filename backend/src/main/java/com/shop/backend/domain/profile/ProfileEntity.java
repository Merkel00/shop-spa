package com.shop.backend.domain.profile;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "profiles")
public class ProfileEntity {

  @Id
  @Column(name = "user_id")
  private Long userId;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String phone = "";

  @Column(nullable = false, columnDefinition = "text")
  private String address = "";


  @Column(nullable = false, columnDefinition = "text")
  private String preferences = "{}";

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt = Instant.now();
}