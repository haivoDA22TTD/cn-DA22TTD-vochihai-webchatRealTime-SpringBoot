package org.chatapp.backend.messageroom;

import org.chatapp.backend.messageroommember.MessageRoomMemberDTO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RoomKeyHelper {

    public String key(MessageRoomDTO result) {
        if (result == null || result.getMembers() == null || result.getMembers().isEmpty()) {
            return "empty";
        }

        // Lấy danh sách username từ MemberDTO
        List<String> usernames = result.getMembers()
                .stream()
                .map(MessageRoomMemberDTO::getUsername)
                .sorted()
                .toList();

        return usernames.hashCode() + "_" + usernames.size();
    }
}