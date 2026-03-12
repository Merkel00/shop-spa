package com.shop.backend.web.promo;

import com.shop.backend.domain.promo.PromoCodeRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping({"/api/promoCodes", "/api/promocodes"})
public class PromoCodesController {

  private final PromoCodeRepository repo;

  public PromoCodesController(PromoCodeRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public PromoCodeDto getByCode(@RequestParam String code) {
    var c = (code == null ? "" : code.trim());
    var p = repo.findByCodeIgnoreCase(c)
        .filter(x -> Boolean.TRUE.equals(x.getIsActive()))
        .filter(x -> x.getExpiresAt() == null || x.getExpiresAt().isAfter(Instant.now()))
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Promo code not found"));

    return new PromoCodeDto(p.getCode(), p.getDiscountPercent());
  }

  public record PromoCodeDto(String code, BigDecimal discountPercent) {}
}