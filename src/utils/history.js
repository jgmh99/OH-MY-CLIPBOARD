function getHistorySearchableText(item, messages) {
  if (item.kind === 'image') {
    return [messages.imageItem, item.altText || '', item.note || ''].join(' ').trim();
  }

  return [item.text || '', item.note || ''].join(' ').trim();
}

export function filterHistory(history, query, messages, filter) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredByType = filter === 'locked'
    ? history.filter((item) => item.locked)
    : history;

  if (!normalizedQuery) return filteredByType;

  return filteredByType.filter((item) => {
    const searchable = getHistorySearchableText(item, messages).toLowerCase();
    return searchable.includes(normalizedQuery);
  });
}
