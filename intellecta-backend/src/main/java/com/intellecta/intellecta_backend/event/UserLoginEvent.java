package com.intellecta.intellecta_backend.event;

import com.intellecta.intellecta_backend.model.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.time.LocalDateTime;

@Getter
public class UserLoginEvent extends ApplicationEvent {

    private final User user;
    private final LocalDateTime loginTime;

    public UserLoginEvent(Object source, User user, LocalDateTime loginTime) {
        super(source);
        this.user = user;
        this.loginTime = loginTime;
    }
}
