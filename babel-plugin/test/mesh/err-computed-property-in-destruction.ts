const key = "key";

interface Props {
  [key]: number;
}

function err({ [key]: $add = 23 }: Props) {}
