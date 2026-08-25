"use client";

import React, { useState } from "react";

/**
 * High-Fidelity Omnichannel Live Social Previews
 * Supports: Instagram, X (Twitter), LinkedIn, Facebook, YouTube, Pinterest
 */

export default function PlatformPreviews({
  platform = "twitter",
  content = "",
  mediaFiles = [],
  user = null,
  account = null,
}) {
  const authorName = account?.account_name || user?.full_name || "SocialPilot Official";
  const authorHandle = account?.account_id
    ? `@${account.account_id}`
    : user?.username
    ? `@${user.username}`
    : "@socialpilot";
  const avatarUrl = user?.avatar_url || null;
  const initial = (authorName[0] || "S").toUpperCase();

  // Helper to format hashtags with styling
  const renderFormattedText = (text) => {
    if (!text) {
      return (
        <span className="text-gray-400 italic">
          Start typing your message to see the live preview...
        </span>
      );
    }

    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      if (word.startsWith("#") || word.startsWith("@")) {
        return (
          <span key={i} className="text-blue-500 font-medium hover:underline">
            {word}
          </span>
        );
      }
      if (word.startsWith("http://") || word.startsWith("https://")) {
        return (
          <span key={i} className="text-blue-500 underline break-all">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2">
      {/* Platform Switch Rendering */}
      {platform === "instagram" && (
        <InstagramPreview
          authorName={authorName}
          authorHandle={authorHandle}
          avatarUrl={avatarUrl}
          initial={initial}
          content={content}
          mediaFiles={mediaFiles}
          renderFormattedText={renderFormattedText}
        />
      )}

      {platform === "twitter" && (
        <TwitterPreview
          authorName={authorName}
          authorHandle={authorHandle}
          avatarUrl={avatarUrl}
          initial={initial}
          content={content}
          mediaFiles={mediaFiles}
          renderFormattedText={renderFormattedText}
        />
      )}

      {platform === "linkedin" && (
        <LinkedInPreview
          authorName={authorName}
          authorHandle={authorHandle}
          avatarUrl={avatarUrl}
          initial={initial}
          content={content}
          mediaFiles={mediaFiles}
          renderFormattedText={renderFormattedText}
        />
      )}

      {platform === "facebook" && (
        <FacebookPreview
          authorName={authorName}
          avatarUrl={avatarUrl}
          initial={initial}
          content={content}
          mediaFiles={mediaFiles}
          renderFormattedText={renderFormattedText}
        />
      )}

      {platform === "youtube" && (
        <YouTubePreview
          authorName={authorName}
          avatarUrl={avatarUrl}
          initial={initial}
          content={content}
          mediaFiles={mediaFiles}
          renderFormattedText={renderFormattedText}
        />
      )}

      {platform === "pinterest" && (
        <PinterestPreview
          authorName={authorName}
          avatarUrl={avatarUrl}
          initial={initial}
          content={content}
          mediaFiles={mediaFiles}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 1. INSTAGRAM FEED PREVIEW
// -------------------------------------------------------------
function InstagramPreview({
  authorName,
  authorHandle,
  avatarUrl,
  initial,
  content,
  mediaFiles,
  renderFormattedText,
}) {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-all duration-300">
      {/* IG Top Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-[1.5px] overflow-hidden flex items-center justify-center font-bold text-xs">
              {avatarUrl ? (
                <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-slate-800 dark:text-slate-200">{initial}</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight lowercase">
                {authorHandle.replace("@", "")}
              </span>
              <svg className="w-3.5 h-3.5 text-blue-500 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5">Original Audio</span>
          </div>
        </div>
        <button type="button" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Media Canvas Area */}
      <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
        {mediaFiles && mediaFiles.length > 0 ? (
          <div className="w-full h-full relative">
            <img
              src={mediaFiles[activeMediaIdx]?.preview || mediaFiles[activeMediaIdx]?.url || mediaFiles[activeMediaIdx]}
              alt="Post asset"
              className="w-full h-full object-cover"
            />
            {mediaFiles.length > 1 && (
              <>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                  {activeMediaIdx + 1}/{mediaFiles.length}
                </div>
                <div className="absolute inset-x-2 bottom-3 flex justify-center gap-1.5">
                  {mediaFiles.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveMediaIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeMediaIdx === i ? "w-5 bg-blue-500" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <svg className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Add photo or video to preview media</span>
          </div>
        )}
      </div>

      {/* Engagement Action Bar */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
            <button type="button" className="hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button type="button" className="hover:text-blue-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button type="button" className="hover:text-emerald-500 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <button type="button" className="hover:text-yellow-500 text-slate-700 dark:text-slate-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Likes Count */}
        <p className="text-xs font-bold mb-1.5">1,248 likes</p>

        {/* Caption */}
        <div className="text-xs leading-relaxed line-clamp-4 whitespace-pre-line mb-2">
          <span className="font-bold mr-1.5 lowercase">{authorHandle.replace("@", "")}</span>
          {renderFormattedText(content)}
        </div>

        {/* Timestamp */}
        <p className="text-[10px] uppercase font-semibold text-slate-400">Just now</p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. X (TWITTER) PREVIEW
// -------------------------------------------------------------
function TwitterPreview({
  authorName,
  authorHandle,
  avatarUrl,
  initial,
  content,
  mediaFiles,
  renderFormattedText,
}) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 shadow-xl p-4 font-sans text-slate-900 dark:text-zinc-100 transition-all duration-300">
      <div className="flex gap-3">
        {/* Author Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        {/* Main Tweet Body */}
        <div className="flex-1 min-w-0">
          {/* User Line */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-sm truncate">{authorName}</span>
              <svg className="w-4 h-4 text-sky-500 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              <span className="text-xs text-zinc-500 truncate">{authorHandle}</span>
              <span className="text-zinc-500 text-xs">·</span>
              <span className="text-zinc-500 text-xs shrink-0">1m</span>
            </div>
            <button type="button" className="text-zinc-500 hover:text-sky-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="text-sm leading-relaxed whitespace-pre-line break-words mb-3">
            {renderFormattedText(content)}
          </div>

          {/* Media Attachments */}
          {mediaFiles && mediaFiles.length > 0 && (
            <div
              className={`rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-3 grid gap-0.5 ${
                mediaFiles.length === 1 ? "grid-cols-1 max-h-72" : "grid-cols-2 max-h-64"
              }`}
            >
              {mediaFiles.slice(0, 4).map((file, i) => (
                <div key={i} className="relative aspect-video bg-zinc-900 overflow-hidden">
                  <img
                    src={file.preview || file.url || file}
                    alt="attachment"
                    className="w-full h-full object-cover"
                  />
                  {i === 3 && mediaFiles.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                      +{mediaFiles.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Engagement Bar */}
          <div className="flex items-center justify-between text-zinc-500 max-w-sm pt-1 text-xs">
            <div className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>12</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>4</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>58</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>1.8K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. LINKEDIN PREVIEW
// -------------------------------------------------------------
function LinkedInPreview({
  authorName,
  authorHandle,
  avatarUrl,
  initial,
  content,
  mediaFiles,
  renderFormattedText,
}) {
  return (
    <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-all duration-300">
      {/* Header */}
      <div className="p-4 flex items-start justify-between border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-base overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm text-slate-900 dark:text-white hover:underline cursor-pointer">
                {authorName}
              </span>
              <span className="text-xs text-slate-400">· 1st</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              Growth Strategist & Marketing Operations • 12.4k followers
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
              <span>Just now</span>
              <span>•</span>
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z" />
              </svg>
            </div>
          </div>
        </div>
        <button type="button" className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
            <circle cx="5" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Post Text */}
      <div className="p-4 text-xs leading-relaxed whitespace-pre-line">
        {renderFormattedText(content)}
      </div>

      {/* Media Attachment */}
      {mediaFiles && mediaFiles.length > 0 && (
        <div className="w-full bg-slate-100 dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800">
          <img
            src={mediaFiles[0]?.preview || mediaFiles[0]?.url || mediaFiles[0]}
            alt="LinkedIn asset"
            className="w-full max-h-80 object-cover"
          />
        </div>
      )}

      {/* Reaction Summary Counts */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px]">👏</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px]">💡</span>
          </span>
          <span className="ml-1 font-medium">84 reactions</span>
        </div>
        <span>14 comments • 6 reposts</span>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-slate-300">
        <button type="button" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span>👍 Like</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span>💬 Comment</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span>🔄 Repost</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span>🚀 Send</span>
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. FACEBOOK PREVIEW
// -------------------------------------------------------------
function FacebookPreview({ authorName, avatarUrl, initial, content, mediaFiles, renderFormattedText }) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" /> : initial}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm hover:underline cursor-pointer">{authorName}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Just now</span>
              <span>·</span>
              <span>🌎 Public</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 text-xs leading-relaxed whitespace-pre-line">
        {renderFormattedText(content)}
      </div>

      {mediaFiles && mediaFiles.length > 0 && (
        <div className="w-full bg-slate-100 dark:bg-slate-950">
          <img
            src={mediaFiles[0]?.preview || mediaFiles[0]?.url || mediaFiles[0]}
            alt="Facebook Asset"
            className="w-full max-h-72 object-cover"
          />
        </div>
      )}

      <div className="px-4 py-2 border-t border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <span>👍 ❤️ 240</span>
        <span>18 Comments · 7 Shares</span>
      </div>

      <div className="px-3 py-1 flex justify-around text-xs font-semibold text-slate-600 dark:text-slate-300">
        <button type="button" className="flex items-center gap-1.5 py-1.5 hover:text-blue-600">
          👍 Like
        </button>
        <button type="button" className="flex items-center gap-1.5 py-1.5 hover:text-blue-600">
          💬 Comment
        </button>
        <button type="button" className="flex items-center gap-1.5 py-1.5 hover:text-blue-600">
          ↗️ Share
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. YOUTUBE COMMUNITY PREVIEW
// -------------------------------------------------------------
function YouTubePreview({ authorName, avatarUrl, initial, content, mediaFiles, renderFormattedText }) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl p-4 font-sans text-slate-900 dark:text-zinc-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" /> : initial}
        </div>
        <div>
          <span className="font-bold text-xs">{authorName}</span>
          <span className="text-[10px] text-zinc-500 block">Community Post • 2 hours ago</span>
        </div>
      </div>

      <div className="text-xs leading-relaxed whitespace-pre-line mb-3">
        {renderFormattedText(content)}
      </div>

      {mediaFiles && mediaFiles.length > 0 && (
        <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-3">
          <img
            src={mediaFiles[0]?.preview || mediaFiles[0]?.url || mediaFiles[0]}
            alt="YouTube Community asset"
            className="w-full max-h-72 object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-6 text-xs text-zinc-500 pt-1">
        <span className="hover:text-red-500 cursor-pointer flex items-center gap-1">👍 1.2K</span>
        <span className="hover:text-red-500 cursor-pointer flex items-center gap-1">👎</span>
        <span className="hover:text-red-500 cursor-pointer flex items-center gap-1">💬 142 Comments</span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. PINTEREST PIN PREVIEW
// -------------------------------------------------------------
function PinterestPreview({ authorName, avatarUrl, initial, content, mediaFiles }) {
  return (
    <div className="w-full max-w-xs rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      <div className="relative aspect-[2/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
        {mediaFiles && mediaFiles.length > 0 ? (
          <img
            src={mediaFiles[0]?.preview || mediaFiles[0]?.url || mediaFiles[0]}
            alt="Pinterest Pin"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <svg className="w-12 h-12 mb-2 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="text-xs font-semibold">Vertical Image Recommended (2:3)</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button type="button" className="px-4 py-2 rounded-full bg-red-600 text-white font-bold text-xs shadow-lg hover:bg-red-700 transition-colors">
            Save
          </button>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-bold text-sm line-clamp-2 mb-1.5">
          {content ? content.slice(0, 60) : "Pin Title Preview"}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {content || "Your pin description will appear here."}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
            {initial}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            {authorName}
          </span>
        </div>
      </div>
    </div>
  );
}
