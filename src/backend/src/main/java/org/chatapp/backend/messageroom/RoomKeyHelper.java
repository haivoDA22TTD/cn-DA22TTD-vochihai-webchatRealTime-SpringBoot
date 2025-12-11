package org.chatapp.backend.messageroom;

import org.chatapp.backend.messageroommember.MessageRoomMemberDTO;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Helper class tạo Room Key duy nhất cho phòng chat
 * 
 * Mục đích: Đảm bảo mỗi nhóm người dùng chỉ có 1 phòng chat duy nhất
 * 
 * Ví dụ chat 1-1:
 * - User A chat với User B → roomKey = "alice_bob" (sắp xếp alphabet)
 * - User B chat với User A → roomKey = "alice_bob" (cùng key)
 * → Cả 2 trường hợp đều dùng chung 1 phòng
 * 
 * Ví dụ chat nhóm:
 * - Nhóm gồm A, B, C → roomKey = hashCode của ["A", "B", "C"] + "_3"
 * - Thêm D vào nhóm → tạo phòng mới với key khác
 * 
 * Thuật toán:
 * 1. Lấy danh sách username của tất cả thành viên
 * 2. Sắp xếp theo alphabet (đảm bảo thứ tự nhất quán)
 * 3. Tạo key từ hashCode + số lượng thành viên
 */
@Component
public class RoomKeyHelper {

    /**
     * Tạo room key từ MessageRoomDTO
     * @param result - DTO chứa thông tin phòng và danh sách thành viên
     * @return Room key duy nhất
     */
    public String key(MessageRoomDTO result) {
        // Kiểm tra null và empty
        if (result == null || result.getMembers() == null || result.getMembers().isEmpty()) {
            return "empty";
        }

        // 1. Lấy danh sách username từ MemberDTO
        // 2. Sắp xếp theo alphabet để đảm bảo thứ tự nhất quán
        //    Ví dụ: ["bob", "alice", "charlie"] → ["alice", "bob", "charlie"]
        List<String> usernames = result.getMembers()
                .stream()
                .map(MessageRoomMemberDTO::getUsername)  // Lấy username từ mỗi member
                .sorted()                                 // Sắp xếp alphabet
                .toList();                                // Chuyển thành List

        // 3. Tạo key: hashCode của list + số lượng thành viên
        // hashCode đảm bảo cùng danh sách → cùng hash
        // Thêm size để phân biệt các nhóm có hash trùng nhau
        return usernames.hashCode() + "_" + usernames.size();
    }
}