export const findAllRows = async (
  client: any,
  table: string,
  limit = 1000,
  orderBy?: string,
  orderDirection?: string,
  offset?: number
) => {
  const selected = await client.query(`
    SELECT *
    FROM ${table}
    ${
      orderBy
        ? 'ORDER BY ' + orderBy + (orderDirection ? ' ' + orderDirection : '')
        : ''
    }
    LIMIT ${limit}
    ${offset ? 'OFFSET ' + offset : ''}
  `);
  return selected.rows;
};

export const findFirstRowWithId = async (
  client: any,
  table: string,
  id: string
) => {
  return (
    await client.query(`
    SELECT *
    FROM ${table}
    WHERE id='${id}'
    ORDER BY id ASC
    LIMIT 1
  `)
  ).rows[0];
};
