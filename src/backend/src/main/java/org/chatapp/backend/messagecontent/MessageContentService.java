package org.chatapp.backend.messagecontent;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageContentService {

    private final MessageContentRepository messageContentRepository;
    private final MessageContentMapper messageContentMapper;


    @Cacheable(value = "lastMessage", key = "#messageRoomId")
    public MessageContentDTO getLastMessage(final UUID messageRoomId) {
        return messageContentRepository.findTopByMessageRoomIdOrderByDateSentDesc(messageRoomId)
                .map(m -> messageContentMapper.toDTO(m, new MessageContentDTO()))
                .orElse(null);
    }


    @Cacheable(value = "roomMessages", key = "#roomId")
    public List<MessageContentDTO> getMessagesByRoomId(final UUID roomId) {
        return messageContentRepository.findByMessageRoomIdOrderByDateSent(roomId)
                .stream()
                .map(m -> messageContentMapper.toDTO(m, new MessageContentDTO()))
                .toList();
    }


    @Caching(
            put = {@CachePut(value = "roomMessages", key = "#result.messageRoomId")},
            evict = {
                    @CacheEvict(value = "lastMessage", key = "#result.messageRoomId"),
                    @CacheEvict(value = "roomMessages", key = "#result.messageRoomId"),
                    @CacheEvict(value = "unseenCount", allEntries = true), // tất cả unseen count thay đổi
                    @CacheEvict(value = "userRoomList", allEntries = true), // từ MessageRoomService
                    @CacheEvict(value = "rooms", allEntries = true)         // chi tiết phòng
            }
    )
    public MessageContentDTO save(final MessageContentDTO messageContentDTO) {
        final MessageContent messageContent = messageContentRepository.save(messageContentMapper.toEntity(messageContentDTO, new MessageContent()));
        return messageContentMapper.toDTO(messageContent, new MessageContentDTO());
    }


    @Cacheable(value = "unseenCount", key = "#roomId + '_' + #username")
    public Long countUnseenMessage(final UUID roomId, final String username) {
        return messageContentRepository.countUnseenMessage(roomId, username);
    }
    // ===========================================================================
    //  Gọi khi user đã đọc hết tin nhắn trong phòng
    // ===========================================================================
    @CacheEvict(value = "unseenCount", allEntries = true)
    public void markAsSeen(UUID roomId, String username) {
        // Cập nhật lastSeen trong MessageRoomMember (nếu cần)
        // → gọi từ controller hoặc service khác
    }

    // ===========================================================================
    //  Xóa cache thủ công khi cần (gọi từ nơi khác nếu cần)
    // ===========================================================================
    @CacheEvict(value = {"lastMessage", "roomMessages"}, key = "#roomId")
    public void evictMessageCaches(UUID roomId) {
        // Dùng khi xóa phòng, xóa tin nhắn.
    }

}





