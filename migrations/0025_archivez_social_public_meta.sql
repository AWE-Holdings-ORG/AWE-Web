PRAGMA foreign_keys=ON;

-- Tha X Filez social/public presentation layer.
-- Raw source filenames remain untouched in artist_media.title because Dropbox
-- delivery depends on the exact source name. Public naming is an overlay.

CREATE TABLE IF NOT EXISTS archive_media_public_meta (
  media_id INTEGER PRIMARY KEY,
  public_title TEXT,
  public_caption TEXT,
  updated_by_member_id INTEGER,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE,
  FOREIGN KEY(updated_by_member_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS media_likes (
  media_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(media_id,member_id),
  FOREIGN KEY(media_id) REFERENCES artist_media(id) ON DELETE CASCADE,
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_likes_media_time
  ON media_likes(media_id,created_at);

CREATE INDEX IF NOT EXISTS idx_archive_public_meta_updated
  ON archive_media_public_meta(updated_at);
