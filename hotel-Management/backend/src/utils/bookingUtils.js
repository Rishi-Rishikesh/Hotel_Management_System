export async function checkDateOverlap(model, query) {
    const existingBookings = await model.find(query);
    return existingBookings.length > 0;
  }