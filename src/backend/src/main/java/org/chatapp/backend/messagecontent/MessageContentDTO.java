package org.chatapp.backend.messagecontent;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageContentDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private UUID id;
    private String content;
    private LocalDateTime dateSent;
    private MessageType messageType;
    private UUID messageRoomId;
    private String sender;
}
