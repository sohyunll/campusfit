import { Router } from "express";
import { supabase } from "../db/supabaseClient.js";
const router = Router();

function daysUntil(dateStr) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const deadline = new Date(`${dateStr}T00:00:00Z`);
  return Math.round((deadline - today) / 86400000);
}

async function toPost(row) {
  const { data: listing } = await supabase
    .from("listings")
    .select("deadline_date")
    .eq("id", row.listing_id)
    .single();
  const dDay = listing ? daysUntil(listing.deadline_date) : undefined;
  const { data: comments } = await supabase
    .from("comments")
    .select("id, who, text")
    .eq("post_id", row.id)
    .order("id");
  return {
    id: row.id,
    listingId: row.listing_id,
    title: row.title,
    meta: row.meta,
    dDay,
    body: row.body,
    status: row.status,
    comments: comments || [],
  };
}

router.get("/", async (req, res) => {
  const { listingId } = req.query;
  let query = supabase.from("board_posts").select("*");
  if (listingId) query = query.eq("listing_id", listingId);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(await Promise.all(data.map(toPost)));
});

router.get("/:id", async (req, res) => {
  const { data: row, error } = await supabase
    .from("board_posts")
    .select("*")
    .eq("id", req.params.id)
    .single();
  if (error || !row) return res.status(404).json({ error: "not found" });
  res.json(await toPost(row));
});

router.post("/", async (req, res) => {
  const { listingId, title, meta, body } = req.body;
  if (!listingId || !title || !meta || !body) {
    return res.status(400).json({ error: "listingId, title, meta, body는 필수입니다" });
  }
  // listingId는 Supabase listings(장학금·지자체혜택 등)뿐 아니라 DB에 저장하지 않고
  // 실시간으로 불러오는 온통청년(youth-*) 리스팅도 가리킬 수 있어서, 여기서 존재 여부를
  // 확인하지 않는다 (board_posts.listing_id의 외래키 제약도 같은 이유로 제거했다).
  const id = `p-${Date.now()}`;
  const { error } = await supabase
    .from("board_posts")
    .insert({ id, listing_id: listingId, title, meta, body });
  if (error) return res.status(500).json({ error: error.message });

  const { data: row } = await supabase.from("board_posts").select("*").eq("id", id).single();
  res.status(201).json(await toPost(row));
});
router.patch("/:id", async (req, res) => {
  const { data: post } = await supabase
    .from("board_posts")
    .select("id")
    .eq("id", req.params.id)
    .single();
  if (!post) return res.status(404).json({ error: "not found" });

  const { title, meta, body } = req.body;
  if (!title || !meta || !body) {
    return res.status(400).json({ error: "title, meta, body는 필수입니다" });
  }
  const { error } = await supabase
    .from("board_posts")
    .update({ title, meta, body })
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  const { data: row } = await supabase.from("board_posts").select("*").eq("id", req.params.id).single();
  res.json(await toPost(row));
});

router.delete("/:id", async (req, res) => {
  const { data: post } = await supabase
    .from("board_posts")
    .select("id")
    .eq("id", req.params.id)
    .single();
  if (!post) return res.status(404).json({ error: "not found" });

  // comments가 board_posts를 참조하고 있어서 게시글보다 먼저 지워야 한다.
  const { error: commentError } = await supabase.from("comments").delete().eq("post_id", req.params.id);
  if (commentError) return res.status(500).json({ error: commentError.message });

  const { error } = await supabase.from("board_posts").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  res.status(204).end();
});

router.patch("/:id/status", async (req, res) => {
  const { data: post } = await supabase
    .from("board_posts")
    .select("id")
    .eq("id", req.params.id)
    .single();
  if (!post) return res.status(404).json({ error: "not found" });

  const { error } = await supabase
    .from("board_posts")
    .update({ status: "closed" })
    .eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ status: "closed" });
});
router.post("/:id/comments", async (req, res) => {
  const { data: post } = await supabase
    .from("board_posts")
    .select("id")
    .eq("id", req.params.id)
    .single();
  if (!post) return res.status(404).json({ error: "not found" });
  const { who, text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const comment = { who: who || "익명", text };
  const { data: inserted, error } = await supabase
    .from("comments")
    .insert({ post_id: req.params.id, who: comment.who, text: comment.text })
    .select("id, who, text")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(inserted);
});

router.patch("/:id/comments/:commentId", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  const { data: comment } = await supabase
    .from("comments")
    .select("id")
    .eq("id", req.params.commentId)
    .eq("post_id", req.params.id)
    .single();
  if (!comment) return res.status(404).json({ error: "not found" });

  const { error } = await supabase.from("comments").update({ text }).eq("id", req.params.commentId);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ id: comment.id, text });
});

router.delete("/:id/comments/:commentId", async (req, res) => {
  const { data: comment } = await supabase
    .from("comments")
    .select("id")
    .eq("id", req.params.commentId)
    .eq("post_id", req.params.id)
    .single();
  if (!comment) return res.status(404).json({ error: "not found" });

  const { error } = await supabase.from("comments").delete().eq("id", req.params.commentId);
  if (error) return res.status(500).json({ error: error.message });

  res.status(204).end();
});

export default router;
