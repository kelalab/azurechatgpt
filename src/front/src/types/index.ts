export type Message = {
  uuid?: String;
  content: String;
  role: String;
  cost?: Number;
  sources?: String[];
  visible: Boolean;
};
