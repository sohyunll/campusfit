import { Link, useOutletContext } from "react-router-dom";

export default function MyPosts() {
  const { myPosts, boardPosts, listings } = useOutletContext();

  const myBoardPosts = boardPosts
    .filter((p) => myPosts.includes(p.id))
    .sort((a, b) => a.dDay - b.dDay);

  return (
    <div className="detail">
      <p className="crumb">
        <Link to="/">홈</Link>
      </p>
      <h1 style={{ fontWeight: 800, fontSize: 32, letterSpacing: "-.02em", margin: "0 0 8px" }}>내가 쓴 글</h1>
      <p className="cat-sub">직접 등록한 팀원모집 글이에요. 이 브라우저에만 저장돼요.</p>
      <div className="divider-list">
        {myBoardPosts.map((p) => {
          const listing = listings.find((l) => l.id === p.listingId);
          return (
            <Link className="row" to={`/board/post/${p.id}`} key={p.id}>
              <div className="main">
                <div className="top-line">
                  {listing && <span className="tag">{listing.title}</span>}
                  <span className="title">{p.title}</span>
                  {p.status === "closed" && <span className="pill-neutral">모집완료</span>}
                </div>
                <div className="desc">{p.meta}</div>
              </div>
              <span className={p.dDay <= 7 ? "pill-alert" : "pill-neutral"}>D-{p.dDay}</span>
            </Link>
          );
        })}
        {myBoardPosts.length === 0 && (
          <p className="cat-sub">아직 등록한 팀원모집 글이 없어요. 공고의 팀원모집 화면에서 글을 써보세요.</p>
        )}
      </div>
    </div>
  );
}
