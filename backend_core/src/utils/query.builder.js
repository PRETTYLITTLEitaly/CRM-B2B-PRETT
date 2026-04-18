/**
 * Helper universale per costruire query Prisma (Filtri, Ricerca, Paginazione)
 */
const buildPrismaQuery = (queryParams, searchFields = []) => {
  const { 
    page = 1, 
    limit = 20, 
    sortBy = 'createdAt', 
    order = 'desc', 
    search, 
    ...filters 
  } = queryParams;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // 1. Costruzione Filtri di Ricerca Testuale (OR)
  const searchQuery = search && searchFields.length > 0 ? {
    OR: searchFields.map(field => ({
      [field]: { contains: search, mode: 'insensitive' }
    }))
  } : {};

  // 2. Costruzione Filtri Precisi (Es: status, region)
  const exactFilters = {};
  Object.keys(filters).forEach(key => {
    if (filters[key] && key !== 'minRevenue' && key !== 'maxRevenue') {
      exactFilters[key] = filters[key];
    }
  });

  // 3. Costruzione Filtri Range (Es: fatturato min/max)
  const rangeFilters = {};
  if (filters.minRevenue || filters.maxRevenue) {
    rangeFilters.totalAmount = {
      ...(filters.minRevenue && { gte: parseFloat(filters.minRevenue) }),
      ...(filters.maxRevenue && { lte: parseFloat(filters.maxRevenue) }),
    };
  }

  return {
    where: {
      ...searchQuery,
      ...exactFilters,
      ...rangeFilters,
    },
    orderBy: {
      [sortBy]: order
    },
    skip,
    take
  };
};

module.exports = { buildPrismaQuery };
