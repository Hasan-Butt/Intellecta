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

import com.intellecta.intellecta_backend.util.LevelUtils;

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
    private String bio;
    private String avatarUrl;

    @Column(nullable = false)
    @ColumnDefault("1")
    private boolean studyReminders = true;

    @Column(nullable = false)
    @ColumnDefault("1")
    private boolean achievementAlerts = true;

    @Column(nullable = false)
    @ColumnDefault("0")
    private boolean weeklyReports = false;

    @Column(nullable = false)
    @ColumnDefault("6.0")
    private double dailyGoalHours = 6.0;

    @Column(nullable = false)
    @ColumnDefault("0")
    private boolean anonymousMode = false;

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
        this.level = LevelUtils.calculateLevel(xp);
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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public boolean isStudyReminders() {
        return studyReminders;
    }

    public void setStudyReminders(boolean studyReminders) {
        this.studyReminders = studyReminders;
    }

    public boolean isAchievementAlerts() {
        return achievementAlerts;
    }

    public void setAchievementAlerts(boolean achievementAlerts) {
        this.achievementAlerts = achievementAlerts;
    }

    public boolean isWeeklyReports() {
        return weeklyReports;
    }

    public void setWeeklyReports(boolean weeklyReports) {
        this.weeklyReports = weeklyReports;
    }

    public double getDailyGoalHours() {
        return dailyGoalHours;
    }

    public void setDailyGoalHours(double dailyGoalHours) {
        this.dailyGoalHours = dailyGoalHours;
    }

    public boolean isAnonymousMode() {
        return anonymousMode;
    }

    public void setAnonymousMode(boolean anonymousMode) {
        this.anonymousMode = anonymousMode;
    }
}
