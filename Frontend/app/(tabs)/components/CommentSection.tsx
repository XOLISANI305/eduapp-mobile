// CommentSection.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface Comment {
  id: number;
  body: string;
  author: string;
  created_at: string;
}

interface CommentSectionProps {
  answerId: number;
  comments?: Comment[]; // optional to avoid undefined issues
  onAddComment?: (answerId: number, body: string) => Promise<void>; // optional
}

export default function CommentSection({ answerId, comments = [], onAddComment }: CommentSectionProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(answerId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowComments(!showComments)}>
        <Text style={styles.toggleButton}>
          {showComments ? '▼' : '▶'} {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </Text>
      </TouchableOpacity>

      {showComments && (
        <View style={styles.commentsContainer}>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Text style={styles.commentAuthor}>{item.author}</Text>
                <Text style={styles.commentBody}>{item.body}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No comments yet</Text>
            }
          />

          {/* Input box appears only if onAddComment exists */}
          {onAddComment && (
            <View style={styles.inputContainer}>
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                style={styles.input}
                multiline
              />
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                style={[
                  styles.submitButton,
                  (!newComment.trim() || isSubmitting) && styles.disabledButton,
                ]}
              >
                <Text style={styles.submitButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  toggleButton: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  commentsContainer: {
    marginTop: 8,
    paddingLeft: 10,
  },
  comment: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B0B44',
    marginBottom: 2,
  },
  commentBody: {
    fontSize: 13,
    color: '#333',
  },
  emptyText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    maxHeight: 80,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: '#CC5500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
