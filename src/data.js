import axios from "axios";
import moment from "moment-timezone";
import groupBy from "lodash/groupBy";
import keys from "lodash/keys";
import sortBy from "lodash/sortBy";

let slotCacheDate;
let slotCache;

const getSlots = async () => {
  if (slotCache !== undefined) {
    const cacheAge = moment().diff(slotCacheDate, "minutes");
    if (cacheAge < 2) {
      return slotCache;
    }
  }
  const slotData = await axios
    .get(
      "https://triomic.github.io/climbing-gym-scraper/sessions.json?rnd=" +
        Math.random()
    )
    .then(({ data }) => data);
  slotCache = { ...slotData };
  slotCacheDate = moment();
  return slotData;
};

export const getGyms = async () => {
  const slots = await getSlots();
  return keys(groupBy(slots.data, "gym"));
};

export const querySlots = async ({ gym, date = moment() }) => {
  const slots = await getSlots();
  return formatSlots(
    slots.data.filter((slot) => slot.gym === gym),
    gym,
    slots.last_updated
  );
};

export const escapeString = (string) =>
  string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const formatSlots = (slots, gym, lastUpdated) => {
  const groupedSlots = groupBy(
    slots.map((slot) => ({
      ...slot,
      date: moment(slot.start).format("dddd, DD MMM"),
    })),
    "date"
  );
  return `Here are the slots for *${escapeString(gym)}*:\n\n${sortBy(
    keys(groupedSlots),
    [
      function (o) {
        return moment(o, "dddd, DD MMM");
      },
    ]
  )
    .map(
      (date) =>
        `*${date}*\n${escapeString(
          sortBy(groupedSlots[date], "start")
            .map(
              (slot) =>
                `${slot.spaces > 0 ? "✅" : "❌"} \`${moment(slot.start).format(
                  "hh:mmA"
                )}: ${slot.spaces}\``
            )
            .join("\n")
        )}`
    )
    .join("\n\n")}\n\nLast updated ${moment(lastUpdated).fromNow()}`;
};
