// - Import react components
import { firebaseRef, firebaseAuth, db } from 'data/firestoreClient'
import _ from 'lodash'

import { SocialError } from 'core/domain/common'
import { ICommentService } from 'core/services/comments'
import { Comment } from 'core/domain/comments'
import { injectable } from 'inversify'

/**
 * Firbase comment service
 *
 * @export
 * @class CommentService
 * @implements {ICommentService}
 */
@injectable()
export class CommentService implements ICommentService {

  /**
   * Add comment
   *
   * @memberof CommentService
   */
  public addComment: (comment: Comment)
    => Promise<string> = (comment) => {
      return new Promise<string>((resolve,reject) => {
        let commentRef = db.collection('comments')
        commentRef.add(comment).then((result) => {
          resolve(result.id)
        })
        .catch((error: any) => {
          reject(new SocialError(error.code,error.message))
        })
      })
    }

  /**
   * Get comments
   *
   * @memberof CommentService
   */
  public getComments: (postId: string, callback: (resultComments: { [postId: string]: { [commentId: string]: Comment } }) => void)
    => void = (postId, callback) => {
      let commentsRef = db.collection(`comments`).where('postId', '==', postId)
      commentsRef.onSnapshot((snapshot) => {
        let parsedData: {[postId: string]: {[commentId: string]: Comment}} = {[postId]: {}}
        snapshot.forEach((result) => {
          parsedData[postId][result.id] = {
            id: result.id,
            ...result.data() as Comment
          }
        })
        if (callback) {
          callback(parsedData)
        }
      })
    }

  /**
   * Update comment
   *
   * @memberof CommentService
   */
  public updateComment: (comment: Comment)
    => Promise<void> = (comment) => {
      return new Promise<void>((resolve,reject) => {
        const batch = db.batch()
        const commentRef = db.collection(`comments`).doc(comment.id!)

        batch.update(commentRef, {...comment})
        batch.commit().then(() => {
          resolve()
        })
        .catch((error: any) => {
          reject(new SocialError(error.code,error.message))
        })
      })
    }

  /**
   * Delete comment
   *
   * @memberof CommentService
   */
  public deleteComment: (commentId: string)
    => Promise<void> = (commentId) => {
      return new Promise<void>((resolve,reject) => {
        const commentCollectionRef = db.collection(`comments`)
        const commentRef = commentCollectionRef.doc(commentId)

        const batch = db.batch()
        batch.delete(commentRef)
        batch.commit().then(() => {
          resolve()
        })
        .catch((error: any) => {
          reject(new SocialError(error.code,error.message))
        })
      })
    }
}
