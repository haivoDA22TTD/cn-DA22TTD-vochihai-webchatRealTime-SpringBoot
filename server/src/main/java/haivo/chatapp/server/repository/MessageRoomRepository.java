package haivo.chatapp.server.repository;

import haivo.chatapp.server.model.MessageRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRoomRepository extends JpaRepository<MessageRoomMember, UUID> {

}
