export const YakuzaData = {
    journalId: null,
    image: null,
    title: null,
    subtitle1: null,
    subtitle2: null
};

export function createYakuzaDataFromDefaultJournal(journal) {
    // Convert Map to array and sort by sort property
    const sortedPages = Array.from(journal?.pages?.values() || [])
        .sort((a, b) => a.sort - b.sort);
    
    return {
        journalId: journal?._id,
        image: sortedPages[0]?.src,
        title: sortedPages[0]?.name,
        subtitle1: sortedPages[1]?.name,
        subtitle2: sortedPages[2]?.name
    };
}

export function createYakuzaDataFromDefaultJournalId(journalId) {
    const journal = game.journal.get(journalId);
    // Convert Map to array and sort by sort property
    return createYakuzaDataFromDefaultJournal(journal);
}

export function createYakuzaData(journalId, image, title, subtitle1, subtitle2) {
    return {
        journalId: journalId,
        image: image,
        title: title,
        subtitle1: subtitle1,
        subtitle2: subtitle2
    };
}
