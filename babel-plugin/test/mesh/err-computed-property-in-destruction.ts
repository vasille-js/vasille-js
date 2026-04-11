const key = "key";

interface Props {
  [key]: number;
}

function err123({ [key]: $add = 23 }: Props) {}
