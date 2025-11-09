package haivo.chatapp.server.repository;

import haivo.chatapp.server.enums.UserStatus;
import haivo.chatapp.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface UserRepository extends JpaRepository<User, String> {

    List<User> findAllByStatus(UserStatus status);

}
