import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { boardPosts, addComment, listings, myPosts, closeBoardPost } = useOutletContext();
  const post = boardPosts.find((p) => p.id === postId);
  const listing = listings.find((l) => l.id === post.listingId);
  const isOwner = myPosts.includes(post.id);

  const [commentText, setCommentText] = useState("");

  const handleRegister = () => {
    if (!commentText.trim()) return;
    addComment(post.id, { who: "나", text: commentText.trim() });
    setCommentText("");
  };

  const handleClose = async () => {
    await closeBoardPost(post.id);
    navigate(`/board/listing/${listing.id}`);
  };

  return (
    <div className="detail">
      <p className="crumb">
        <Link to={`/board/listing/${listing.id}`}>홈</Link> /{" "}
        <Link to={`/board/listing/${listing.id}`}>팀원모집</Link>
      </p>
      <div className="detail-meta">
        <span className="cat">
          {listing.title} · D-{post.dDay}
        </span>
      </div>
      <div className="board-head">
        <h1 style={{ fontSize: 30 }}>{post.title}</h1>
      </div>
      <p className="body-txt">{post.body}</p>
      <p className="comment-head">댓글 {post.comments.length}</p>
      {post.comments.map((c, i) => (
        <div className="comment" key={i}>
          <div className="who">{c.who}</div>
          <div className="txt">{c.text}</div>
        </div>
      ))}
      <textarea
        placeholder="댓글로 지원 의사를 남겨보세요"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        {isOwner && post.status !== "closed" ? (
          <button
            className="btn-outline"
            style={{ display: "inline-block", width: "auto", padding: "9px 18px", fontSize: 13 }}
            onClick={handleClose}
          >
            모집완료
          </button>
        ) : (
          <span />
        )}
        <button className="btn-accent" onClick={handleRegister}>
          등록
        </button>
      </div>
    </div>
  );
}
