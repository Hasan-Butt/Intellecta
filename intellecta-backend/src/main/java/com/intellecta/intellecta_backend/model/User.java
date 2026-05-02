package com.intellecta.intellecta_backend.model;

import java.time.LocalDate;

import org.hibernate.annotations.ColumnDefault;

import com.intellecta.intellecta_backend.enums.UserRoles;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private UserRoles role;

    @Column(nullable = false)
    @ColumnDefault("0")
    private long xp = 0;

    @Column(nullable = false)
    @ColumnDefault("1")
    private int level = 1;

    @Column(nullable = false)
    @ColumnDefault("0")
    private int streakDays = 0;

    @Column
    private LocalDate lastStudyDate;

    
    private String status;

    // Constructors
    public User() {}

    public User(String username, String email, String password, UserRoles role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRoles getRole() {
        return role;
    }

    public void setRole(UserRoles role) {
        this.role = role;
    }

    public long getXp(){
        return xp;
    }

    public void setXp(long xp){
        this.xp = xp;
    }

    public int getLevel(){
        return level;
    }

    public void setLevel(int level){
        this.level = level; 
    }

    public int getStreakDays() {
        return streakDays;
    }

    public void setStreakDays(int streakDays){
        this.streakDays = streakDays;
    }

    public LocalDate getLastStudyDate() {
        return lastStudyDate;
    }

    public void setLastStudyDate(LocalDate lastStudyDate) {
        this.lastStudyDate = lastStudyDate;
    }

    
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
