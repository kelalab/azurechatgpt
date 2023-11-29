import xml.etree.ElementTree as ET
import sys, getopt
import os 
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.text_splitter import MarkdownHeaderTextSplitter
import shutil
import re

class Splitter:
    def __init__(self):
        self.alphabets=['-','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p']

    def split(self, input, useLangchain = True, split = False):
        tree = ET.parse(input)
        root = tree.getroot()

        section = 1
        filetext = ''
        files = []
        for child in root:
            ## main title of the xml document
            if child.tag == 'title':
                filetext += '# ' + child.text
            ## all subsections are topics
            if child.tag == 'topic':
                subsection = 1
                for nested in child:
                    if nested.tag == 'title':
                        filetext += '\n## ' + nested.text

                    if nested.tag == 'body':
                        for elem in nested:
                            if elem.tag == 'p':
                                txt = self.get_text(elem)
                                filetext += '\n' + txt
                                files.append(filetext)
                    if nested.tag == 'topic':
                        topic = self.get_topic(nested, '{}.{}'.format(section,subsection))
                        files = files + topic.split('$SOF')
                        subsection += 1

        files = list(filter(None,files))
        md = ''.join(files)

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size = 2048,
            chunk_overlap = 150,
            length_function = len,
            add_start_index = True
        )
        headers_to_split_on = [
            ('#', 'Header 1'),
            ('##', 'Header 2'),
            ('###', 'Header 3'),
            ('####', 'Header 4'),
            ('#####', 'Header 5'),
            ('######', 'Header 6')
        ]
        text_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)

        texts = text_splitter.split_text(md)

        return texts

    def get_topic(self, node: ET.Element, section, subsection=-1, optionalsubsection=-1):
        depth = node.attrib['otherprops']
        debug = False
        print('section: ', section)
        if section == '1.1' or section == '1.1.5':
            print('section:', section, subsection, optionalsubsection, depth)
            debug = True
        else:
            debug = False
        x = 1
        y = 1
        text = ''
        text += '$SOF'
        for child in node:
            if child.tag == 'title':
                if subsection>0:
                    if depth == 'depth2':
                        section = '{}.{}'.format(section, self.alphabets[optionalsubsection])
                    else:
                        section = '{}.{}'.format(section, subsection)
                depth = len(section.split('.'))
                section_title = '\n'+'#'*depth + ' {} {}'.format(section, self.get_text(child))
                text += section_title
            
            if child.tag == 'body':
                for elem in child:
                    if elem.tag == 'p':
                        txt = self.get_text(elem, debug)
                        text += '\n' + txt
                    if elem.tag == 'ul':
                        txt = self.get_list(elem)
                        text += '\n' + txt
                    if elem.tag == 'ol':
                        txt = self.get_list(elem, True)
                        text += '\n' + txt
                    if elem.tag == 'example':
                        txt = self.get_text(elem)
                        text += '\n>ESIMERKKI: ' + txt + '\n'
            if child.tag == 'topic':
                topic = self.get_topic(child, section, x, y)
                if topic.split(' ')[1][-1].isalpha():
                    x -= 1
                text = text + '\n'+ topic
                x += 1
                y += 1
        return text

    def get_list(self, node: ET.Element, ordered=False, prev_index=-1):
        ''' Parse a list element '''
        text = ''
        n = 1
        for child in node:
            if child.tag == 'li':
                if ordered:
                    text += ' {}. '.format(n) + self.get_text(child)+'\n'
                    n += 1
                else:
                    text += ' - ' + self.get_text(child)+'\n'
                for nested in child:
                    if nested.tag == 'ul':
                        self.get_list(nested)
                    if nested.tag == 'ol':
                        self.get_list(nested)
        return text

    def get_text(self, node: ET.Element, debug=False):
        '''Gets text out of an XML Node'''

        # Get initial text
        text = node.text if node.text else ''
        text = ' '.join(text.split())
        # Get all text from child nodes recursively
        for child_node in node:
            

            if len(text) > 0:
                if child_node.tag == 'xref':
                  href = child_node.get('href')
                  if debug: print('href:', href)
                  if href.startswith('http'):
                    link_text = self.get_text(child_node)
                    link_elem = f'<a href="{href}" target="_blank">{link_text}</a>'
                    if debug: print('LINKKI: ')
                    #print(text)
                    #print('link text: ', link_text)
                    if debug: print('element:', link_elem)
                    if debug: print('END LINKKI')
                    text += ' ' + link_elem
                  else:
                    text += ' ' + self.get_text(child_node)
                else:
                    text += ' ' + self.get_text(child_node)
            else:
                if child_node.tag == 'xref':
                    href = child_node.get('href')
                    if debug: print('href:', href)
                    if href.startswith('http'):
                        link_text = self.get_text(child_node)
                        link_elem = f'<a href="{href}" target="_blank">{link_text}</a>'
                        if debug: print('LINKKI: ')
                        #print(text)
                        #print('link text: ', link_text)
                        if debug: print('element:', link_elem)
                        if debug: print('END LINKKI')
                        text += link_elem
                    else:
                       text += self.get_text(child_node) 
                else:
                    text += self.get_text(child_node)
        # Get text that occurs after child nodes
        text += ' ' + ' '.join(node.tail.split()) if node.tail else ''
        if debug: print('text: ', text)
        return text
