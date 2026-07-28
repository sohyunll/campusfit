import { Link, useOutletContext } from "react-router-dom";

export default function PickListingForBoard() {
  const { listings } = useOutletContext();

  const activityListings = listings
    .filter((l) => l.categoryId === "activity")
    .sort((a, b) => a.dDay - b.dDay);

  return (
    <div className="detail">
      <p className="crumb">
        <Link to="/board">홈 / 팀원모집</Link>
      </p>
      <h1 style={{ fontWeight: 800, fontSize: 32, letterSpacing: "-.02em", margin: "0 0 8px" }}>
        어떤 공고의 팀원을 구하세요?
      </h1>
      <p className="cat-sub">글쓰기는 특정 공고에 연결돼야 해서, 먼저 공고를 골라주세요.</p>
      <div className="divider-list" style={{ marginTop: 20 }}>
        {activityListings.map((l) => (
          <Link className="row" to={`/board/listing/${l.id}/write`} key={l.id}>
            <div className="main">
              <div className="top-line">
                <span className="title">{l.title}</span>
              </div>
              <div className="desc">{l.desc}</div>
            </div>
            <span className={l.dDay <= 7 ? "pill-alert" : "pill-neutral"}>D-{l.dDay}</span>
          </Link>
        ))}
        {activityListings.length === 0 && <p className="cat-sub">대외활동 공고가 없어요.</p>}
      </div>
    </div>
  );
}
