package haivo.chatapp.server.model;

import haivo.chatapp.server.dto.MessageRoomMemberKey;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name="message_room_member")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(MessageRoomMemberKey.class)
public class MessageRoomMember {
    @Id
    @ManyToOne
    @JoinColumn(name = "message_room_id")
    private MessageRoom messageRoom;

    @Id
    @ManyToOne
    @JoinColumn(name = "username")
    private User user;


    private Boolean isAdmin;
    private LocalDateTime lastSeen;
}
