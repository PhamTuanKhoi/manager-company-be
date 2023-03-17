export function formatTime(datetime) {
  return (
    new Date(datetime).getHours() * 3600 + new Date(datetime).getMinutes() * 60
  );
}

export const timeCustom = (time) => {
  const timed = `${
    Math.floor(time / 3600) < 10
      ? '0' + Math.floor(time / 3600)
      : Math.floor(time / 3600)
  }:${
    Math.floor((time - Math.floor(time / 3600) * 3600) / 60) < 10
      ? '0' + Math.floor((time - Math.floor(time / 3600) * 3600) / 60)
      : Math.floor((time - Math.floor(time / 3600) * 3600) / 60)
  }`;
  return timed === '00:00' ? '...' : timed;
};
