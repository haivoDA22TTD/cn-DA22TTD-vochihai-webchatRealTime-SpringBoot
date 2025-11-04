package haivo.chatapp.server.repository;

import haivo.chatapp.server.dto.MessageRoomMemberKey;
import haivo.chatapp.server.model.MessageRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface MessageRoomMemberRepository extends JpaRepository<MessageRoomMember, MessageRoomMemberKey> {


}
