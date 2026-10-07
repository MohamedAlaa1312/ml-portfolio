/**
 * Formats date strings professionally for portfolio and CMS display.
 * Transforms raw database dates (e.g. '2022-01-01') into 'Jan 2022',
 * while preserving already formatted strings.
 */
export function formatExperienceDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Already formatted (e.g. 'Jan 2022' or 'Present')
  if (/^[A-Za-z]{3}\s+\d{4}$/.test(trimmed) || trimmed.toLowerCase() === 'present') {
    return trimmed;
  }

  // Parse YYYY-MM-DD or YYYY-MM
  const parts = trimmed.split('-');
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return `${monthNames[month - 1]} ${year}`;
    }
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }

  return trimmed;
}

/**
 * Returns formatted date range for an experience milestone.
 */
export function formatExperienceRange(
  startDate: string,
  endDate?: string | null,
  isCurrent?: boolean
): string {
  const start = formatExperienceDate(startDate);
  if (isCurrent) {
    return `${start} — Present`;
  }
  const end = endDate ? formatExperienceDate(endDate) : 'Present';
  return `${start} — ${end}`;
}
