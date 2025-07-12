export function formatTime(secs: number): string {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        return `${hours}:${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    }
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
}

export function formatDate(date: string): { formatted: string; relative: string } {
    if (!date) return { formatted: "", relative: "" };

    const parsedDate = new Date(date);
    const day = parsedDate.getDate().toString().padStart(2, "0");
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = parsedDate.getFullYear();

    let hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hoursStr = hours.toString().padStart(2, "0");

    const formatted = `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;

    const relative = getRelativeTime(parsedDate);
    return { formatted, relative };
}

export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) {
        return diffSecs <= 1 ? "Just now" : `${diffSecs} seconds ago`;
    } else if (diffMins < 60) {
        return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
        return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else if (diffWeeks < 4) {
        return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
    } else if (diffMonths < 12) {
        return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
    } else {
        return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
    }
}
