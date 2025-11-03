package haivo.chatapp.server.dto;

import haivo.chatapp.server.model.MessageRoom;
import haivo.chatapp.server.model.User;
import lombok.Data;

import java.io.Serializable;

@Data
public class MessageRoomMemberKey implements Serializable {
    private User user;
    private MessageRoom messageRoom;

}
