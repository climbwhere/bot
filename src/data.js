import axios from "axios";
import moment from "moment";
import groupBy from "lodash/groupBy";
import keys from "lodash/keys";

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
    slots.data.filter(
      (slot) => slot.gym === gym && date.diff(moment(slot.start), "days") <= 1
    )
  );
};

const formatSlots = (slots) =>
  slots
    .map(
      (slot) =>
        `${slot.gym} ${moment(slot.start).toDate().toLocaleString("en-SG", {
          hour: "numeric",
          hour12: true,
          minute: "numeric",
          minute12: true,
        })} - ${moment(slot.end).toDate().toLocaleString("en-SG", {
          hour: "numeric",
          hour12: true,
          minute: "numeric",
          minute12: true,
        })} ${slot.spaces} spaces`
    )
    .join("\n");
