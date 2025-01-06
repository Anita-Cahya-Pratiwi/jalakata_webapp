import React, { Component } from 'react';
import { Editor } from 'react-draft-wysiwyg';
import { saveTextToFirebase, listenToFirebaseText, updateActiveUsers, listenToActiveUsers } from '../firebaseHelper';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import { isEqual } from 'lodash';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import { stateToHTML } from 'draft-js-export-html';

export default class TextEditor extends Component {
    state = {
        editorState: null,
        currentRawContent: null,
        isSyncing: false,
        error: null,
        activeUsers: {}, // State untuk menyimpan pengguna aktif
        userId: uuidv4(), // Generate unique user ID
        userEmail: 'user@example.com', // Ganti dengan mekanisme login Anda
        isMounted: false, // Flag untuk menandai apakah komponen sudah mounted
    };

    saveToFirebase = (rawContent) => {
        if (this.state.isSyncing) return;
        this.setState({ isSyncing: true });
        saveTextToFirebase('documents/jalakata', rawContent)
            .then(() => {
                this.setState({ isSyncing: false });
            })
            .catch((error) => {
                this.setState({ error: 'Gagal menyimpan teks ke Firebase.' });
                console.error(error);
            });
    };

    onEditorStateChange = (editorState) => {
        this.setState({ editorState }, () => {
            if (this.state.editorState) {
                const rawContent = convertToRaw(this.state.editorState.getCurrentContent());
                if (!isEqual(rawContent, this.state.currentRawContent)) {
                    this.setState({ currentRawContent: rawContent });
                    this.saveToFirebase(rawContent);
                }
            }
        });
    };

    componentDidMount() {
        this.setState({ isMounted: true });
        // Tambahkan pengguna saat ini ke daftar pengguna aktif
        updateActiveUsers('documents/jalakata', this.state.userId, this.state.userEmail, true);

        this.unsubscribeText = listenToFirebaseText(
            'documents/jalakata',
            (newText) => {
                if (newText && newText.blocks && Array.isArray(newText.blocks)) {
                    try {
                        if (!newText.entityMap) {
                            newText.entityMap = {};
                        }
                        const contentState = convertFromRaw(newText);
                        const currentRaw = this.state.editorState ? convertToRaw(this.state.editorState.getCurrentContent()) : null;

                        if (!isEqual(currentRaw, newText) && this.state.isMounted) {
                            const selectionState = this.state.editorState?.getSelection();

                            this.setState({
                                editorState: EditorState.createWithContent(contentState),
                                currentRawContent: newText,
                            }, () => {
                                if (selectionState) {
                                    try {
                                        const newEditorState = EditorState.forceSelection(this.state.editorState, selectionState);
                                        this.setState({ editorState: newEditorState });
                                    } catch (error) {
                                        console.error('Kesalahan forceSelection:', error);
                                        this.setState({ error: 'Kesalahan sinkronisasi (forceSelection).' });
                                    }
                                } else {
                                    const newEditorState = EditorState.moveFocusToEnd(this.state.editorState);
                                    this.setState({ editorState: newEditorState });
                                }
                            });
                        }
                    } catch (error) {
                        console.error('Kesalahan konversi data:', error);
                        this.setState({ error: 'Kesalahan sinkronisasi.' });
                    }
                }
            },
            (error) => {
                this.setState({ error: 'Gagal memuat teks dari Firebase.' });
                console.error(error);
            }
        );

        // Mulai mendengarkan perubahan pada daftar pengguna aktif
        this.unsubscribeActiveUsers = listenToActiveUsers(
            'documents/jalakata',
            (activeUsers) => {
                this.setState({ activeUsers });
            },
            (error) => {
                console.error('Gagal memuat pengguna aktif:', error);
                this.setState({ error: 'Gagal memuat pengguna aktif.' });
            }
        );
    }

    componentWillUnmount() {
        if (this.unsubscribeText) {
            this.unsubscribeText();
        }
        if (this.unsubscribeActiveUsers) {
            this.unsubscribeActiveUsers();
        }
        // Hapus pengguna saat ini dari daftar pengguna aktif
        updateActiveUsers('documents/jalakata', this.state.userId, null, false);
    }

    handleSaveFile = () => {
        if (!this.state.editorState) return;
        const contentState = this.state.editorState.getCurrentContent();
        const htmlContent = stateToHTML(contentState);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    render() {
        const { editorState, error, activeUsers } = this.state;

        return (
            <>
                <div className="active-users">
                    {Object.entries(activeUsers).map(([userId, email]) => (
                        <div key={userId}>
                            User Aktif: {email || 'Tidak Diketahui'}
                        </div>
                    ))}
                </div>
                <div className="text-editor">
                    <div className='inside'>
                        {editorState && (
                            <Editor
                                editorState={editorState}
                                onEditorStateChange={this.onEditorStateChange}
                                placeholder="Tulis teks di sini..."
                                textDirection={'ltr'}
                            />
                        )}
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
                <button onClick={this.handleSaveFile}>
                    Simpan File
                </button>
            </>
        );
    }
}
