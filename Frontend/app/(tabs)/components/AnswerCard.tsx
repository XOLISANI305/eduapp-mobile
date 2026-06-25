/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CommentSection from './CommentSection';

interface Comment {
  id: number;
  body: string;
  author: string;
  created_at: string;
}

interface Answer {
  id: string | number;
  body: string;
  author: string;
  is_accepted?: boolean;
  votes: number;
  comments?: Comment[];
}

interface AnswerCardProps {
  answer?: Answer;
  onAccept: () => void;
  onVote: (vote: number) => void;
  onAddComment?: (answerId: number, body: string) => Promise<void>;
  userVote?: number; // -1 for downvote, 0 for no vote, 1 for upvote
  onVoteChange?: (answerId: number, newVote: number) => void;
}

export default function AnswerCard({
  answer,
  onAccept,
  onVote,
  onAddComment,
  userVote = 0,
  onVoteChange,
}: AnswerCardProps) {
  if (!answer) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>No answer data available</Text>
      </View>
    );
  }

  const [comments, setComments] = useState<Comment[]>(answer.comments ?? []);
  const [currentVote, setCurrentVote] = useState<number>(userVote);

  const handleVote = (vote: number) => {
    // If clicking the same vote button, remove the vote
    if (currentVote === vote) {
      onVote(-vote); // Reverse the previous vote
      setCurrentVote(0);
      if (onVoteChange) {
        onVoteChange(Number(answer.id), 0);
      }
    } 
    // If clicking a different vote button
    else if (currentVote !== 0) {
      Alert.alert(
        'Change Vote?',
        'You have already voted. Do you want to change your vote?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change',
            onPress: () => {
              // Remove old vote and add new vote (net change is 2x the new vote direction)
              onVote(vote - currentVote);
              setCurrentVote(vote);
              if (onVoteChange) {
                onVoteChange(Number(answer.id), vote);
              }
            },
          },
        ]
      );
    } 
    // First time voting
    else {
      onVote(vote);
      setCurrentVote(vote);
      if (onVoteChange) {
        onVoteChange(Number(answer.id), vote);
      }
    }
  };

  const handleAddComment = async (answerId: number, body: string) => {
    if (!onAddComment) return;

    await onAddComment(answerId, body);
    setComments((prev) => [
      ...prev,
      { id: Date.now(), body, author: 'You', created_at: new Date().toISOString() },
    ]);
  };

  return (
    <View style={[styles.card, answer.is_accepted && styles.accepted]}>
      {/* Author header */}
      <View style={styles.header}>
        <Text style={styles.authorName}>👤 {answer.author}</Text>
        {answer.is_accepted && (
          <View style={styles.acceptedBadge}>
            <Text style={styles.acceptedBadgeText}>✓ Accepted Answer</Text>
          </View>
        )}
      </View>

      {/* Answer body */}
      <Text style={styles.body}>{answer.body}</Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        <View style={styles.voteContainer}>
          <TouchableOpacity 
            onPress={() => handleVote(1)}
            style={[
              styles.voteButtonUp,
              currentVote === 1 && styles.voteButtonActive
            ]}
          >
            <Text style={[
              styles.voteButtonText,
              currentVote === 1 && styles.voteButtonTextActive
            ]}>
              👍 {answer.votes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleVote(-1)}
            style={[
              styles.voteButtonDown,
              currentVote === -1 && styles.voteButtonDownActive
            ]}
          >
            <Text style={[
              styles.voteButtonTextDown,
              currentVote === -1 && styles.voteButtonTextDownActive
            ]}>
              👎
            </Text>
          </TouchableOpacity>
        </View>

        {!answer.is_accepted && (
          <TouchableOpacity 
            onPress={onAccept}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptButtonText}>✓ Accept Answer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Comments Section */}
      <CommentSection
        answerId={Number(answer.id)}
        comments={comments}
        onAddComment={handleAddComment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accepted: { 
    borderLeftWidth: 4, 
    borderLeftColor: '#23A455' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  acceptedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  acceptedBadgeText: {
    fontSize: 12,
    color: '#23A455',
    fontWeight: 'bold',
  },
  body: { 
    fontSize: 15, 
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  voteContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  voteButtonUp: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#23A455',
  },
  voteButtonActive: {
    backgroundColor: '#23A455',
  },
  voteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#23A455',
  },
  voteButtonTextActive: {
    color: '#fff',
  },
  voteButtonDown: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  voteButtonDownActive: {
    backgroundColor: '#F44336',
  },
  voteButtonTextDown: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  voteButtonTextDownActive: {
    color: '#fff',
  },
  acceptButton: {
    backgroundColor: '#23A455',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: { 
    color: '#999', 
    fontStyle: 'italic' 
  },
});