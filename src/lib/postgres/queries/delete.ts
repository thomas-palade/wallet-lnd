export const deleteAll = async (client: any, table: string) => {
  return (
    (
      await client.query(`
      DELETE
      FROM ${table}
    `)
    ).rowCount > 0
  );
};