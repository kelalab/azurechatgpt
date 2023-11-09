export type Message = {
  content: String;
  role: String;
  cost?: Number;
  sources?: String[];
  visible: Boolean;
};
